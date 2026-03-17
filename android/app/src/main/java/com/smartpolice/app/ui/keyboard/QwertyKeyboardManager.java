package com.smartpolice.app.ui.keyboard;

import android.app.Activity;
import android.view.View;
import android.widget.TextView;

import com.smartpolice.app.R;

/**
 * QwertyKeyboardManager
 * Secure in-app QWERTY keyboard. Pass the Activity and keyboard container view.
 */
public class QwertyKeyboardManager {

    private final View keyboardContainer;
    private final Activity activity;
    private android.widget.EditText activeField;
    private boolean isUpperCase = true; // Start uppercase

    public QwertyKeyboardManager(Activity activity, View keyboardContainer) {
        this.activity = activity;
        this.keyboardContainer = keyboardContainer;
        setupKeys();
    }

    /** Call this to explicitly set which field receives keyboard input */
    public void setActiveField(android.widget.EditText field) {
        this.activeField = field;
    }

    public void attachToField(android.widget.EditText field) {
        field.setShowSoftInputOnFocus(false);
        // Use a touch listener so we catch every tap, even if the field already has focus
        field.setOnTouchListener((v, event) -> {
            if (event.getAction() == android.view.MotionEvent.ACTION_UP) {
                activeField = field; // Switch to this field
                field.requestFocus();
                show();
            }
            return true; // consume touch so system keyboard stays hidden
        });
    }

    public void show() {
        keyboardContainer.setVisibility(View.VISIBLE);
    }

    public void hide() {
        keyboardContainer.setVisibility(View.GONE);
    }

    private void appendChar(String ch) {
        if (activeField == null) return;
        int start = Math.max(activeField.getSelectionStart(), 0);
        int end = Math.max(activeField.getSelectionEnd(), 0);
        activeField.getText().replace(Math.min(start, end), Math.max(start, end), ch, 0, ch.length());
    }

    private void deleteChar() {
        if (activeField == null) return;
        int start = activeField.getSelectionStart();
        int end = activeField.getSelectionEnd();
        if (start < 0) return;
        if (start != end) {
            activeField.getText().delete(Math.min(start, end), Math.max(start, end));
        } else if (start > 0) {
            activeField.getText().delete(start - 1, start);
        }
    }

    private void setupKeys() {
        // --- Number row ---
        int[] numIds = {R.id.key_1, R.id.key_2, R.id.key_3, R.id.key_4, R.id.key_5,
                        R.id.key_6, R.id.key_7, R.id.key_8, R.id.key_9, R.id.key_0};
        String[] numChars = {"1","2","3","4","5","6","7","8","9","0"};

        for (int i = 0; i < numIds.length; i++) {
            final String ch = numChars[i];
            View v = keyboardContainer.findViewById(numIds[i]);
            if (v != null) v.setOnClickListener(btn -> appendChar(ch));
        }

        // --- Letter keys ---
        int[] letterIds = {
            R.id.key_q, R.id.key_w, R.id.key_e, R.id.key_r, R.id.key_t,
            R.id.key_y, R.id.key_u, R.id.key_i, R.id.key_o, R.id.key_p,
            R.id.key_a, R.id.key_s, R.id.key_d, R.id.key_f, R.id.key_g,
            R.id.key_h, R.id.key_j, R.id.key_k, R.id.key_l,
            R.id.key_z, R.id.key_x, R.id.key_c, R.id.key_v,
            R.id.key_b, R.id.key_n, R.id.key_m
        };
        String[] letterChars = {
            "Q","W","E","R","T","Y","U","I","O","P",
            "A","S","D","F","G","H","J","K","L",
            "Z","X","C","V","B","N","M"
        };

        for (int i = 0; i < letterIds.length; i++) {
            final String letter = letterChars[i];
            View btn = keyboardContainer.findViewById(letterIds[i]);
            if (btn != null) {
                btn.setOnClickListener(v -> appendChar(isUpperCase ? letter : letter.toLowerCase()));
            }
        }

        // --- Special keys ---
        View backspace = keyboardContainer.findViewById(R.id.key_backspace);
        if (backspace != null) backspace.setOnClickListener(v -> deleteChar());

        View space = keyboardContainer.findViewById(R.id.key_space);
        if (space != null) space.setOnClickListener(v -> appendChar(" "));

        View at = keyboardContainer.findViewById(R.id.key_at);
        if (at != null) at.setOnClickListener(v -> appendChar("@"));

        View dot = keyboardContainer.findViewById(R.id.key_dot);
        if (dot != null) dot.setOnClickListener(v -> appendChar("."));

        View hash = keyboardContainer.findViewById(R.id.key_hash);
        if (hash != null) hash.setOnClickListener(v -> appendChar("#"));

        View done = keyboardContainer.findViewById(R.id.key_done);
        if (done != null) done.setOnClickListener(v -> hide());

        // --- Shift ---
        View shiftBtn = keyboardContainer.findViewById(R.id.key_shift);
        if (shiftBtn != null) {
            shiftBtn.setOnClickListener(v -> {
                isUpperCase = !isUpperCase;
                shiftBtn.setAlpha(isUpperCase ? 1.0f : 0.6f);
                for (int i = 0; i < letterIds.length; i++) {
                    View btn = keyboardContainer.findViewById(letterIds[i]);
                    if (btn instanceof TextView) {
                        ((TextView) btn).setText(isUpperCase ? letterChars[i] : letterChars[i].toLowerCase());
                    }
                }
            });
        }
    }
}
