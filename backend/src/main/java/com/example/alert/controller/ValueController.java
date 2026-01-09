package com.example.alert.controller;

import com.example.alert.service.ValueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ValueController {

    private final ValueService valueService;

    @Autowired
    public ValueController(ValueService valueService) {
        this.valueService = valueService;
    }

    @GetMapping("/value")
    public Map<String, Object> getValue() {
        double value = valueService.getLatestValue();
        Map<String, Object> response = new HashMap<>();
        response.put("value", value);
        return response;
    }

    @PostMapping("/value")
    public Map<String, Object> saveValue(@RequestBody Map<String, Object> data) {
        try {
            Number valueNumber = (Number) data.get("value");
            double value = valueNumber.doubleValue();
            String timestamp = (String) data.get("timestamp");
            
            valueService.saveValue(value, timestamp);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "データが正常に保存されました");
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "データの保存に失敗しました: " + e.getMessage());
            return response;
        }
    }

    @GetMapping("/history")
    public Map<String, Object> getHistory(@RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> history = valueService.getHistory(limit);
        Map<String, Object> response = new HashMap<>();
        response.put("history", history);
        return response;
    }

    @PostMapping("/alert")
    public Map<String, Object> sendAlert(@RequestBody Map<String, Object> alertData) {
        try {
            Number valueNumber = (Number) alertData.get("value");
            Number thresholdNumber = (Number) alertData.get("threshold");
            double value = valueNumber.doubleValue();
            double threshold = thresholdNumber.doubleValue();
            String timestamp = (String) alertData.get("timestamp");
            
            valueService.sendAlertEmail(value, threshold, timestamp);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "アラートメールを送信しました");
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "メール送信に失敗しました: " + e.getMessage());
            return response;
        }
    }
}
