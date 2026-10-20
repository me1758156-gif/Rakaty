package io.github.me1758156_gif.twa;

import android.Manifest;
import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

/** Shown when you add the widget: asks once for location so the times fit where you are. */
public class WidgetSetupActivity extends Activity {
    private int widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setResult(RESULT_CANCELED);
        Intent i = getIntent();
        if (i != null && i.getExtras() != null) {
            widgetId = i.getExtras().getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        boolean have = checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        if (have && Build.VERSION.SDK_INT >= 33
                && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 8);
        } else if (have || Build.VERSION.SDK_INT < 23) {
            finishOk();
        } else {
            java.util.ArrayList<String> want = new java.util.ArrayList<>();
            want.add(Manifest.permission.ACCESS_COARSE_LOCATION);
            want.add(Manifest.permission.ACCESS_FINE_LOCATION);
            if (Build.VERSION.SDK_INT >= 33) want.add("android.permission.POST_NOTIFICATIONS");
            requestPermissions(want.toArray(new String[0]), 7);
        }
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        finishOk(); // add the widget either way; without location it uses Alexandria
    }

    private void finishOk() {
        Intent out = new Intent();
        out.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        setResult(RESULT_OK, out);
        PrayerWidgetProvider.updateAll(this);
        finish();
    }
}
