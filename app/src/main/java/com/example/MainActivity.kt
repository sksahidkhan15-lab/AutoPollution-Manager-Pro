package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.AutoPollutionTheme
import com.example.ui.theme.GreenPrimary

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      AutoPollutionTheme {
        Scaffold(
          modifier = Modifier.fillMaxSize()
        ) { innerPadding ->
          AutoPollutionWebView(
            context = this@MainActivity,
            modifier = Modifier
              .fillMaxSize()
              .padding(innerPadding)
          )
        }
      }
    }
  }
}

/**
 * JavaScript Interface enabling 100% Native WhatsApp, SMS, Share, and Storage
 * capabilities directly from the AutoPollution Pro web client.
 */
class WebAppBridge(private val context: Context) {

  @JavascriptInterface
  fun openWhatsApp(phone: String, message: String) {
    try {
      val cleanPhone = phone.replace("+", "").replace(" ", "").trim()
      val uri = Uri.parse("https://api.whatsapp.com/send?phone=$cleanPhone&text=${Uri.encode(message)}")
      val intent = Intent(Intent.ACTION_VIEW, uri).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(intent)
    } catch (e: Exception) {
      // Fallback: Open browser wa.me link
      try {
        val fallbackUri = Uri.parse("https://wa.me/$phone?text=${Uri.encode(message)}")
        context.startActivity(Intent(Intent.ACTION_VIEW, fallbackUri).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        })
      } catch (ex: Exception) {
        Toast.makeText(context, "WhatsApp application not installed", Toast.LENGTH_SHORT).show()
      }
    }
  }

  @JavascriptInterface
  fun openSMS(phone: String, message: String) {
    try {
      val uri = Uri.parse("smsto:$phone")
      val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
        putExtra("sms_body", message)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(intent)
    } catch (e: Exception) {
      Toast.makeText(context, "Unable to launch SMS messaging app", Toast.LENGTH_SHORT).show()
    }
  }

  @JavascriptInterface
  fun shareText(title: String, text: String) {
    try {
      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, title)
        putExtra(Intent.EXTRA_TEXT, text)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(Intent.createChooser(intent, title).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      })
    } catch (e: Exception) {
      Toast.makeText(context, "Share failed: ${e.message}", Toast.LENGTH_SHORT).show()
    }
  }

  @JavascriptInterface
  fun downloadCsv(filename: String, content: String) {
    try {
      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/comma-separated-values"
        putExtra(Intent.EXTRA_SUBJECT, filename)
        putExtra(Intent.EXTRA_TEXT, content)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(Intent.createChooser(intent, "Export $filename").apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      })
      Toast.makeText(context, "CSV ready for export/sharing!", Toast.LENGTH_SHORT).show()
    } catch (e: Exception) {
      Toast.makeText(context, "CSV Export error: ${e.message}", Toast.LENGTH_SHORT).show()
    }
  }

  @JavascriptInterface
  fun showToast(message: String) {
    Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AutoPollutionWebView(
  context: Context,
  modifier: Modifier = Modifier
) {
  var webViewInstance by remember { mutableStateOf<WebView?>(null) }
  var loadingProgress by remember { mutableFloatStateOf(0f) }
  var isLoading by remember { mutableStateOf(true) }

  // Handle hardware / gesture back button
  BackHandler(enabled = webViewInstance?.canGoBack() == true) {
    webViewInstance?.goBack()
  }

  Box(modifier = modifier) {
    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = { ctx ->
        WebView(ctx).apply {
          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            allowFileAccess = true
            allowContentAccess = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
          }

          // Register native bridge interface
          addJavascriptInterface(WebAppBridge(context), "AndroidBridge")

          webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
              loadingProgress = newProgress / 100f
              isLoading = newProgress < 100
            }
          }

          webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
              val url = request?.url?.toString() ?: return false

              // Handle WhatsApp, SMS, Tel, and external links
              if (url.startsWith("whatsapp:") || url.contains("wa.me") || url.contains("api.whatsapp.com")) {
                try {
                  val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                  }
                  context.startActivity(intent)
                  return true
                } catch (e: Exception) {
                  return false
                }
              }

              if (url.startsWith("sms:") || url.startsWith("smsto:")) {
                try {
                  val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(url)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                  }
                  context.startActivity(intent)
                  return true
                } catch (e: Exception) {
                  return false
                }
              }

              if (url.startsWith("tel:") || url.startsWith("mailto:")) {
                try {
                  val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                  }
                  context.startActivity(intent)
                  return true
                } catch (e: Exception) {
                  return false
                }
              }

              return false
            }
          }

          // Load local high-speed bundled asset app
          loadUrl("file:///android_asset/web/index.html")
          webViewInstance = this
        }
      },
      update = { view ->
        webViewInstance = view
      }
    )

    if (isLoading) {
      LinearProgressIndicator(
        progress = { loadingProgress },
        modifier = Modifier
          .fillMaxWidth()
          .align(Alignment.TopCenter),
        color = GreenPrimary
      )
    }
  }
}
