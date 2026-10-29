package io.github.me1758156_gif.twa;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.RelativeSizeSpan;
import android.widget.RemoteViews;

import java.util.Calendar;

/** Home-screen widget: six prayer times on clear glass; the prayer whose time it is right now is highlighted. */
public class PrayerWidgetProvider extends AppWidgetProvider {

    static final String ACTION_REFRESH = "io.github.me1758156_gif.twa.WIDGET_REFRESH";
    static final String PREFS = "widget_prefs";
    // Alexandria, Egypt, used until the phone gives a real location
    static final double DEFAULT_LAT = 31.2001, DEFAULT_LNG = 29.9187;

    private static final int[] COL = {R.id.col0, R.id.col1, R.id.col2, R.id.col3, R.id.col4, R.id.col5};
    private static final int[] NAME = {R.id.name0, R.id.name1, R.id.name2, R.id.name3, R.id.name4, R.id.name5};
    private static final int[] ICON = {R.id.icon0, R.id.icon1, R.id.icon2, R.id.icon3, R.id.icon4, R.id.icon5};
    private static final int[] TIME = {R.id.time0, R.id.time1, R.id.time2, R.id.time3, R.id.time4, R.id.time5};
    private static final String[] LABEL = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, build(context));
        scheduleNext(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) {
        manager.updateAppWidget(id, build(context));
    }

    @Override
    public void onEnabled(Context context) {
        scheduleNext(context);
    }

    @Override
    public void onDisabled(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(refreshIntent(context));
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String a = intent.getAction();
        if (ACTION_REFRESH.equals(a) || Intent.ACTION_TIME_CHANGED.equals(a)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(a) || Intent.ACTION_DATE_CHANGED.equals(a)) {
            updateAll(context);
        }
    }

    static void updateAll(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, PrayerWidgetProvider.class));
        if (ids.length == 0) return;
        RemoteViews rv = build(context);
        for (int id : ids) mgr.updateAppWidget(id, rv);
        scheduleNext(context);
    }

    // ---- location (last known fix if the app has permission, else saved, else Alexandria) ----
    private static double[] location(Context c) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        double lat = Double.longBitsToDouble(sp.getLong("lat", Double.doubleToLongBits(DEFAULT_LAT)));
        double lng = Double.longBitsToDouble(sp.getLong("lng", Double.doubleToLongBits(DEFAULT_LNG)));
        boolean ok = c.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                || c.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        if (ok) {
            try {
                LocationManager lm = (LocationManager) c.getSystemService(Context.LOCATION_SERVICE);
                Location best = null;
                for (String p : lm.getProviders(true)) {
                    Location l = lm.getLastKnownLocation(p);
                    if (l != null && (best == null || l.getTime() > best.getTime())) best = l;
                }
                if (best != null) {
                    lat = best.getLatitude();
                    lng = best.getLongitude();
                    sp.edit().putLong("lat", Double.doubleToRawLongBits(lat))
                            .putLong("lng", Double.doubleToRawLongBits(lng)).apply();
                }
            } catch (SecurityException ignored) { }
        }
        return new double[]{lat, lng};
    }

    private static long[] timesForDay(Calendar day, double[] loc) {
        return PrayerTimes.timesFor(day.get(Calendar.YEAR), day.get(Calendar.MONTH) + 1,
                day.get(Calendar.DAY_OF_MONTH), loc[0], loc[1]);
    }

    /** The times to show, which prayer's time it is right now, and when to refresh next. */
    private static final class State { long[] times; int cur; long nextAt; }

    private static State state(Context c) {
        double[] loc = location(c);
        long now = System.currentTimeMillis();
        long[] t = timesForDay(Calendar.getInstance(), loc);
        State s = new State();
        s.times = t;
        // The current time-slot is the last one that has started. Before Fajr it is still
        // Isha's time (from last night), so Isha stays highlighted until Fajr comes in.
        s.cur = PrayerTimes.ISHA;
        for (int i = 0; i < 6; i++) {
            if (t[i] <= now) s.cur = i;
        }
        long next = -1;
        for (int i = 0; i < 6; i++) {
            if (t[i] > now) { next = t[i]; break; }
        }
        // After today's Isha, show TOMORROW's times (in whatever the clock will say then). On the night the
        // clocks change this means the new clock times appear straight away, not an hour later.
        if (t[PrayerTimes.ISHA] <= now) {
            Calendar tom = Calendar.getInstance();
            tom.add(Calendar.DAY_OF_MONTH, 1);
            long[] t2 = timesForDay(tom, loc);
            s.times = t2;
            s.cur = PrayerTimes.ISHA;
            next = t2[0];
        }
        Calendar mid = Calendar.getInstance();
        mid.set(Calendar.HOUR_OF_DAY, 0);
        mid.set(Calendar.MINUTE, 0);
        mid.set(Calendar.SECOND, 0);
        mid.set(Calendar.MILLISECOND, 0);
        mid.add(Calendar.DAY_OF_MONTH, 1);
        long at = mid.getTimeInMillis();
        if (next != -1 && next < at) at = next;
        // Also refresh right when the phone's clock changes by an hour (summer / winter time), and at least hourly.
        long dst = nextClockChange(now);
        if (dst != -1 && dst < at) at = dst;
        if (now + 3600000L < at) at = now + 3600000L;
        s.nextAt = at;
        return s;
    }

    /** When the phone's UTC offset next changes within the coming 2 days (Egypt's clock change), or -1. */
    private static long nextClockChange(long now) {
        java.util.TimeZone tz = java.util.TimeZone.getDefault();
        int off = tz.getOffset(now);
        for (long x = now + 900000L; x <= now + 48L * 3600000L; x += 900000L) {
            if (tz.getOffset(x) != off) {
                long lo = x - 900000L, hi = x;           // narrow it down to the exact second
                while (hi - lo > 1000L) {
                    long mid = (lo + hi) / 2;
                    if (tz.getOffset(mid) != off) hi = mid; else lo = mid;
                }
                return hi;
            }
        }
        return -1;
    }

    private static RemoteViews build(Context c) {
        RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_prayer);
        State s = state(c);
        Calendar cal = Calendar.getInstance();
        for (int i = 0; i < 6; i++) {
            boolean hl = i == s.cur;
            rv.setTextViewText(NAME[i], LABEL[i]);
            cal.setTimeInMillis(s.times[i]);
            rv.setTextViewText(TIME[i], format(cal));
            rv.setInt(COL[i], "setBackgroundResource", hl ? R.drawable.widget_hl : 0);
            rv.setInt(ICON[i], "setColorFilter", hl ? 0xFFFFFFFF : 0xFFEAF2FF);
            rv.setTextColor(NAME[i], hl ? 0xFFFFFFFF : 0xEBF0F6FF);
            rv.setTextColor(TIME[i], 0xFFFFFFFF);
        }
        Intent launch = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (launch != null) {
            PendingIntent pi = PendingIntent.getActivity(c, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            rv.setOnClickPendingIntent(R.id.root, pi);
        }
        return rv;
    }

    /** "5:38 AM" with a smaller AM/PM. */
    private static CharSequence format(Calendar cal) {
        int h = cal.get(Calendar.HOUR);
        if (h == 0) h = 12;
        String ap = cal.get(Calendar.AM_PM) == Calendar.AM ? "AM" : "PM";
        String txt = h + ":" + (cal.get(Calendar.MINUTE) < 10 ? "0" : "") + cal.get(Calendar.MINUTE) + " " + ap;
        SpannableString sp = new SpannableString(txt);
        sp.setSpan(new RelativeSizeSpan(0.72f), txt.length() - 2, txt.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        return sp;
    }

    private static PendingIntent refreshIntent(Context c) {
        Intent i = new Intent(c, PrayerWidgetProvider.class).setAction(ACTION_REFRESH);
        return PendingIntent.getBroadcast(c, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Wake the widget right after the next prayer time so the highlight moves on. */
    static void scheduleNext(Context c) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            State s = state(c);
            long at = s.nextAt + 1000;
            if (at <= System.currentTimeMillis()) at = System.currentTimeMillis() + 60000;
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC, at, refreshIntent(c));
            else am.set(AlarmManager.RTC, at, refreshIntent(c));
        } catch (Exception ignored) { }
    }
}
