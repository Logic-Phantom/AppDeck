package app.appdeck.deviceapps

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream

/**
 * APPDECK 설치 앱 카탈로그 모듈.
 *
 * - 런처에 표시되는 앱(ACTION_MAIN + CATEGORY_LAUNCHER)만 조회한다.
 * - 아이콘은 앱 캐시 폴더에 PNG로 저장하고 file:// URI만 JS로 넘긴다(SQLite에 Base64를 쌓지 않음).
 * - 앱 목록·패키지명을 로그로 출력하지 않는다.
 * - 앱 삭제/강제 종료 기능은 제공하지 않는다. 시스템 앱 정보 화면으로 이동만 한다.
 */
class AppDeckDeviceAppsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("AppDeckDeviceApps")

    AsyncFunction("getCapabilities") {
      mapOf(
        "platform" to "android",
        "canEnumerateInstalledApps" to true,
        "canReadUsageStats" to true,
        "requiresBroadPackageVisibility" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R),
        "sdkInt" to Build.VERSION.SDK_INT
      )
    }

    AsyncFunction("listLaunchableApps") { includeSystemApps: Boolean ->
      listLaunchable(includeSystemApps)
    }

    AsyncFunction("launchApp") { packageName: String ->
      launch(packageName)
    }

    AsyncFunction("openAppSettings") { packageName: String ->
      try {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName"))
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        mapOf("opened" to true)
      } catch (e: Exception) {
        mapOf("opened" to false, "reason" to "settings_unavailable")
      }
    }

    AsyncFunction("getUsageAccessStatus") {
      if (hasUsageAccess()) "granted" else "denied"
    }

    AsyncFunction("openUsageAccessSettings") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    AsyncFunction("getUsageSummary") { fromMs: Double, toMs: Double ->
      if (!hasUsageAccess()) return@AsyncFunction emptyList<Map<String, Any?>>()
      val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      // 요청한 화면에서 기간별 집계만 조회한다. 이벤트 원본 로그는 읽지 않는다.
      val aggregated = usm.queryAndAggregateUsageStats(fromMs.toLong(), toMs.toLong())
      aggregated.values.map {
        mapOf(
          "packageName" to it.packageName,
          "lastTimeUsed" to (if (it.lastTimeUsed > 0) it.lastTimeUsed.toDouble() else null),
          "totalTimeInForegroundMs" to it.totalTimeInForeground.toDouble()
        )
      }
    }

    AsyncFunction("clearIconCache") {
      iconDir().deleteRecursively()
      true
    }
  }

  private fun listLaunchable(includeSystemApps: Boolean): List<Map<String, Any?>> {
    val pm = context.packageManager
    val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
    val activities = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      pm.queryIntentActivities(launcherIntent, PackageManager.ResolveInfoFlags.of(0L))
    } else {
      @Suppress("DEPRECATION")
      pm.queryIntentActivities(launcherIntent, 0)
    }
    val selfPackage = context.packageName
    val seen = HashSet<String>()
    val result = ArrayList<Map<String, Any?>>()
    val livePackages = HashSet<String>()

    for (info in activities) {
      val pkg = info.activityInfo?.packageName ?: continue
      if (pkg == selfPackage || !seen.add(pkg)) continue
      try {
        val appInfo = info.activityInfo.applicationInfo
        val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0 &&
          (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0
        if (isSystem && !includeSystemApps) continue
        if (!appInfo.enabled) continue
        val pkgInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          pm.getPackageInfo(pkg, PackageManager.PackageInfoFlags.of(0L))
        } else {
          @Suppress("DEPRECATION")
          pm.getPackageInfo(pkg, 0)
        }
        val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          pkgInfo.longVersionCode.toString()
        } else {
          @Suppress("DEPRECATION")
          pkgInfo.versionCode.toString()
        }
        livePackages.add(pkg)
        val category = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) appInfo.category else -1
        result.add(
          mapOf(
            "packageName" to pkg,
            "displayName" to info.loadLabel(pm).toString(),
            "versionName" to pkgInfo.versionName,
            "versionCode" to versionCode,
            "firstInstallTime" to pkgInfo.firstInstallTime.toDouble(),
            "lastUpdateTime" to pkgInfo.lastUpdateTime.toDouble(),
            "isSystemApp" to isSystem,
            "hasLaunchIntent" to true,
            "iconCacheUri" to cacheIcon(pkg, pkgInfo.lastUpdateTime) { info.loadIcon(pm) },
            "platformCategory" to (if (category >= 0) category else null)
          )
        )
      } catch (e: PackageManager.NameNotFoundException) {
        // 스캔 도중 제거된 앱 — 결과에서 제외한다.
        continue
      }
    }
    pruneIconCache(livePackages)
    return result
  }

  private fun launch(packageName: String): Map<String, Any?> {
    val pm = context.packageManager
    val intent = try {
      pm.getLaunchIntentForPackage(packageName)
    } catch (e: Exception) {
      null
    }
    if (intent == null) {
      val installed = try {
        pm.getApplicationInfo(packageName, 0).enabled
      } catch (e: PackageManager.NameNotFoundException) {
        return mapOf("opened" to false, "reason" to "not_installed")
      }
      return mapOf("opened" to false, "reason" to if (installed) "no_launch_intent" else "disabled")
    }
    return try {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
      context.startActivity(intent)
      // OS에 실행 요청이 정상 전달됐다는 의미이며, 화면 표시를 보장하지 않는다.
      mapOf("opened" to true)
    } catch (e: SecurityException) {
      mapOf("opened" to false, "reason" to "permission_denied")
    } catch (e: Exception) {
      mapOf("opened" to false, "reason" to "launch_failed")
    }
  }

  private fun hasUsageAccess(): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun iconDir(): File = File(context.cacheDir, "appdeck-icons").apply { mkdirs() }

  /** 패키지명 + lastUpdateTime 으로 캐시 키를 만들고, 이미 있으면 재사용한다. */
  private fun cacheIcon(pkg: String, updatedAt: Long, load: () -> Drawable): String? {
    val file = File(iconDir(), "${pkg}_$updatedAt.png")
    if (file.exists()) return Uri.fromFile(file).toString()
    return try {
      iconDir().listFiles { f -> f.name.startsWith("${pkg}_") }?.forEach { it.delete() }
      val bitmap = toBitmap(load(), 144)
      FileOutputStream(file).use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
      Uri.fromFile(file).toString()
    } catch (e: Exception) {
      null
    }
  }

  private fun pruneIconCache(live: Set<String>) {
    iconDir().listFiles()?.forEach { f ->
      val pkg = f.name.substringBeforeLast('_')
      if (pkg !in live) f.delete()
    }
  }

  private fun toBitmap(drawable: Drawable, size: Int): Bitmap {
    if (drawable is BitmapDrawable && drawable.bitmap != null) {
      return Bitmap.createScaledBitmap(drawable.bitmap, size, size, true)
    }
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, size, size)
    drawable.draw(canvas)
    return bitmap
  }
}
