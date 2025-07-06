package com.example.alert.service;

import com.example.alert.entity.ValueEntity;
import com.example.alert.repository.ValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ValueService {

    private final ValueRepository valueRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public ValueService(ValueRepository valueRepository, JavaMailSender mailSender) {
        this.valueRepository = valueRepository;
        this.mailSender = mailSender;
    }

    public int getLatestValue() {
        Optional<ValueEntity> entity = Optional.ofNullable(valueRepository.findTopByOrderByTimestampDesc());
        return entity.map(ValueEntity::getValue).orElse(0);
    }

    public void saveValue(int value, String timestamp) {
        ValueEntity entity = new ValueEntity();
        entity.setValue(value);
        
        if (timestamp != null && !timestamp.isEmpty()) {
            entity.setTimestamp(LocalDateTime.parse(timestamp.replace("Z", "")));
        } else {
            entity.setTimestamp(LocalDateTime.now());
        }
        
        valueRepository.save(entity);
    }

    public List<Map<String, Object>> getHistory(int limit) {
        List<ValueEntity> entities = valueRepository.findTopNByOrderByTimestampDesc(limit);
        return entities.stream().map(entity -> {
            Map<String, Object> data = new HashMap<>();
            data.put("value", entity.getValue());
            data.put("timestamp", entity.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            return data;
        }).collect(Collectors.toList());
    }

    public void sendAlertEmail(int value, int threshold, String timestamp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("hiro0507mu@icloud.com");
        message.setSubject("基準値オーバー");
        message.setText(String.format(
            "基準値を超える数値が検出されました。\n\n" +
            "検出値: %d\n" +
            "基準値: %d\n" +
            "検出時刻: %s\n\n" +
            "このメールは自動送信されています。",
            value, threshold, timestamp
        ));
        
        mailSender.send(message);
    }
}
