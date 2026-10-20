package io.github.me1758156_gif.twa;

import java.util.Calendar;
import java.util.TimeZone;

/** Same prayer-time calculation as the website (Egyptian General Authority: Fajr 19.5, Isha 17.5, Asr standard). */
final class PrayerTimes {
    static final int FAJR = 0, SUNRISE = 1, DHUHR = 2, ASR = 3, MAGHRIB = 4, ISHA = 5;

    private PrayerTimes() {}

    private static double fix(double a, double b) {
        a = a - b * Math.floor(a / b);
        return a < 0 ? a + b : a;
    }
    private static double sin(double d) { return Math.sin(Math.toRadians(d)); }
    private static double cos(double d) { return Math.cos(Math.toRadians(d)); }
    private static double tan(double d) { return Math.tan(Math.toRadians(d)); }

    private static double julian(int y, int m, int d) {
        if (m <= 2) { y -= 1; m += 12; }
        int a = y / 100;
        int b = 2 - a + a / 4;
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
    }

    /** Returns {declination, equation of time}. */
    private static double[] sunPos(double jd) {
        double d = jd - 2451545.0;
        double g = fix(357.529 + 0.98560028 * d, 360);
        double q = fix(280.459 + 0.98564736 * d, 360);
        double l = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
        double e = 23.439 - 0.00000036 * d;
        double ra = fix(Math.toDegrees(Math.atan2(cos(e) * sin(l), cos(l))), 360) / 15;
        double eq = q / 15 - ra;
        if (eq > 12) eq -= 24;
        if (eq < -12) eq += 24;
        double decl = Math.toDegrees(Math.asin(sin(e) * sin(l)));
        return new double[]{decl, eq};
    }

    /** Six times (epoch millis) for the calendar day y-m-d (m = 1..12) at the given place. */
    static long[] timesFor(int y, int m, int d, double lat, double lng) {
        double jd = julian(y, m, d) - lng / 360;
        double[] sp = sunPos(jd + 0.5);
        double decl = sp[0], eq = sp[1];
        double noon = 12 - eq - lng / 15;
        double asrAngle = -Math.toDegrees(Math.atan(1 / (1 + tan(Math.abs(lat - decl)))));
        double[] h = new double[6];
        h[FAJR] = noon - ha(19.5, lat, decl);
        h[SUNRISE] = noon - ha(0.833, lat, decl);
        h[DHUHR] = noon;
        h[ASR] = noon + ha(asrAngle, lat, decl);
        h[MAGHRIB] = noon + ha(0.833, lat, decl);
        h[ISHA] = noon + ha(17.5, lat, decl);

        // Whole minutes, like published timetables: Fajr rounds up (never early), the rest drop the seconds
        for (int i = 0; i < 6; i++) {
            h[i] = (i == FAJR) ? Math.ceil(h[i] * 60 - 1e-9) / 60 : Math.floor(h[i] * 60 + 1e-9) / 60;
        }

        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        c.clear();
        c.set(y, m - 1, d, 0, 0, 0);
        long base = c.getTimeInMillis();
        long[] out = new long[6];
        for (int i = 0; i < 6; i++) out[i] = base + Math.round(h[i] * 3600000.0);
        return out;
    }

    private static double ha(double a, double lat, double decl) {
        double v = (-sin(a) - sin(lat) * sin(decl)) / (cos(lat) * cos(decl));
        v = Math.max(-1, Math.min(1, v));
        return Math.toDegrees(Math.acos(v)) / 15;
    }
}
