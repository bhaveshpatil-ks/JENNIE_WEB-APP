package com.jenniemusic.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class MediaNotificationReceiver extends BroadcastReceiver {
    public static final String ACTION_PLAY_PAUSE = "com.jenniemusic.app.ACTION_PLAY_PAUSE";
    public static final String ACTION_NEXT = "com.jenniemusic.app.ACTION_NEXT";
    public static final String ACTION_PREV = "com.jenniemusic.app.ACTION_PREV";
    public static final String ACTION_STOP = "com.jenniemusic.app.ACTION_STOP";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String action = intent.getAction();

        if (ACTION_STOP.equals(action)) {
            MediaPlaybackService.stop(context);
            MainActivity.handleMediaAction("stop");
        } else if (ACTION_PLAY_PAUSE.equals(action)) {
            MainActivity.handleMediaAction("play_pause");
        } else if (ACTION_NEXT.equals(action)) {
            MainActivity.handleMediaAction("next");
        } else if (ACTION_PREV.equals(action)) {
            MainActivity.handleMediaAction("prev");
        }
    }
}
