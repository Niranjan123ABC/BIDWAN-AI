package Repository;

import Entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findBySessionIdOrderByTimestampAsc(String sessionId);
}