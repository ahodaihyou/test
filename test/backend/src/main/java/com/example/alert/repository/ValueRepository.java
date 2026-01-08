package com.example.alert.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.alert.entity.ValueEntity;
import java.util.List;

public interface ValueRepository extends JpaRepository<ValueEntity, Long> {
    ValueEntity findTopByOrderByTimestampDesc();
    
    @Query("SELECT v FROM ValueEntity v ORDER BY v.timestamp DESC LIMIT :limit")
    List<ValueEntity> findTopNByOrderByTimestampDesc(@Param("limit") int limit);
}
