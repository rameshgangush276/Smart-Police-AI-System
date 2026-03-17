package com.smartpolice.app.ui.complaint;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.smartpolice.app.R;
import com.smartpolice.app.models.ComplaintResponse;

import java.util.List;

public class ComplaintAdapter extends ArrayAdapter<ComplaintResponse.Complaint> {

    public ComplaintAdapter(@NonNull Context context, @NonNull List<ComplaintResponse.Complaint> complaints) {
        super(context, 0, complaints);
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        ComplaintResponse.Complaint complaint = getItem(position);

        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_complaint, parent, false);
        }

        TextView tvComplaintId = convertView.findViewById(R.id.tvComplaintId);
        TextView tvStatus = convertView.findViewById(R.id.tvStatus);
        TextView tvComplainantName = convertView.findViewById(R.id.tvComplainantName);
        TextView tvCrimeType = convertView.findViewById(R.id.tvCrimeType);
        TextView tvDate = convertView.findViewById(R.id.tvDate);

        if (complaint != null) {
            tvComplaintId.setText(complaint.getComplaintId() != null ? complaint.getComplaintId() : "N/A");
            
            String status = complaint.getStatus() != null ? complaint.getStatus() : "NEW";
            tvStatus.setText(status);
            if ("CLOSED".equalsIgnoreCase(status)) {
                tvStatus.setBackgroundColor(Color.parseColor("#28A745")); // status_closed
            } else if ("UNDER_REVIEW".equalsIgnoreCase(status) || "UNDER REVIEW".equalsIgnoreCase(status)) {
                tvStatus.setBackgroundColor(Color.parseColor("#FFC107")); // status_review
            } else if ("FIR_REGISTERED".equalsIgnoreCase(status) || "FIR REGISTERED".equalsIgnoreCase(status) || "OPEN".equalsIgnoreCase(status)) {
                tvStatus.setBackgroundColor(Color.parseColor("#DC3545"));
            } else {
                tvStatus.setBackgroundColor(Color.parseColor("#007BFF")); // status_new
            }

            tvComplainantName.setText("Name: " + (complaint.getComplainantName() != null ? complaint.getComplainantName() : ""));
            tvCrimeType.setText("Crime: " + (complaint.getCrimeCategory() != null ? complaint.getCrimeCategory() : ""));
            tvDate.setText("Date: " + (complaint.getIncidentDate() != null ? complaint.getIncidentDate() : ""));
        }

        return convertView;
    }
}
