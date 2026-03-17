package com.smartpolice.app.ui.complaint;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;

import com.smartpolice.app.R;

import java.util.HashMap;
import java.util.Map;

public class CustomKeypad extends LinearLayout implements View.OnClickListener {

    private InputConnection inputConnection;
    private Map<Integer, String> keyValues = new HashMap<>();

    public CustomKeypad(Context context) {
        this(context, null);
    }

    public CustomKeypad(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public CustomKeypad(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.layout_qwerty_keypad, this, true);
        
        // Register keys
        int[] buttonIds = {
            R.id.keyQ, R.id.keyW, R.id.keyE, R.id.keyR, R.id.keyT, R.id.keyY, R.id.keyU, R.id.keyI, R.id.keyO, R.id.keyP,
            R.id.keyA, R.id.keyS, R.id.keyD, R.id.keyF, R.id.keyG, R.id.keyH, R.id.keyJ, R.id.keyK, R.id.keyL,
            R.id.keyZ, R.id.keyX, R.id.keyC, R.id.keyV, R.id.keyB, R.id.keyN, R.id.keyM,
            R.id.keySpace, R.id.keyDel, R.id.keyEnter
        };

        for (int id : buttonIds) {
            View view = findViewById(id);
            if (view instanceof Button) {
                view.setOnClickListener(this);
                if (id != R.id.keyDel && id != R.id.keyEnter && id != R.id.keyShift && id != R.id.keyMode) {
                    keyValues.put(id, ((Button) view).getText().toString());
                }
            }
        }
    }

    @Override
    public void onClick(View v) {
        if (inputConnection == null) return;

        int id = v.getId();
        if (id == R.id.keyDel) {
            inputConnection.deleteSurroundingText(1, 0);
        } else if (id == R.id.keyEnter) {
            inputConnection.commitText("\n", 1);
        } else if (id == R.id.keySpace) {
            inputConnection.commitText(" ", 1);
        } else {
            String value = keyValues.get(id);
            if (value != null) {
                inputConnection.commitText(value, 1);
            }
        }
    }

    public void setInputConnection(InputConnection ic) {
        this.inputConnection = ic;
    }
}
