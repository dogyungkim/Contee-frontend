-- ============================================================================
-- Contee Database Schema (MySQL 8.0+)
-- 2026년 기준 최종 버전
-- song_form_parts만 AUTO_INCREMENT, 나머지는 UUID(BINARY(16))
-- ============================================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. 사용자 (OAuth2 중심)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(512) NULL,
    provider VARCHAR(30) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    last_login_at DATETIME(3) NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_provider_pair (provider, provider_id),
    INDEX idx_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '사용자 계정 (OAuth2)';

-- ---------------------------------------------------------------------------
-- 2. 팀 (교회/찬양팀)
-- ---------------------------------------------------------------------------
CREATE TABLE teams (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    name VARCHAR(100) NOT NULL,
    short_code VARCHAR(12) NOT NULL UNIQUE COMMENT '초대코드',
    description TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    INDEX idx_short_code (short_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '찬양팀/교회 단위';

-- ---------------------------------------------------------------------------
-- 3. 팀 멤버십 & 권한
-- ---------------------------------------------------------------------------
CREATE TABLE team_members (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    team_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    role ENUM(
        'OWNER',
        'ADMIN',
        'MEMBER',
        'VIEWER'
    ) NOT NULL DEFAULT 'MEMBER',
    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_team_user (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '팀 멤버십 및 역할';

-- ---------------------------------------------------------------------------
-- 4. 곡 마스터
-- ---------------------------------------------------------------------------
CREATE TABLE songs (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(200) NULL,
    key_signature VARCHAR(20) NULL,
    bpm INT NULL,
    ccli_number VARCHAR(50) NULL,
    youtube_url VARCHAR(500) NULL,
    sheet_music_url VARCHAR(500) NULL,
    audio_url VARCHAR(500) NULL,
    created_by BINARY(16) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    INDEX idx_title_artist (title, artist),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '곡 공식 정보';

-- ---------------------------------------------------------------------------
-- 5. 팀별 곡
-- ---------------------------------------------------------------------------
CREATE TABLE team_songs (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    team_id BINARY(16) NOT NULL,
    song_id BINARY(16) NULL,
    custom_title VARCHAR(200) NULL,
    custom_key_signature VARCHAR(20) NULL,
    custom_bpm INT NULL,
    is_favorite TINYINT(1) NOT NULL DEFAULT 0,
    note TEXT NULL,
    created_by BINARY(16) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_team_song (team_id, song_id),
    INDEX idx_team_favorite (team_id, is_favorite),
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '팀별 곡 커스터마이징';

-- ---------------------------------------------------------------------------
-- 6. Song Form 파트 (AUTO_INCREMENT 유지)
-- ---------------------------------------------------------------------------
CREATE TABLE song_form_parts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_song_id BINARY(16) NOT NULL,
    part_order TINYINT UNSIGNED NOT NULL COMMENT '1부터 순서',
    part_type ENUM(
        'INTRO',
        'VERSE',
        'PRE_CHORUS',
        'CHORUS',
        'BRIDGE',
        'INTERLUDE',
        'OUTRO',
        'TAG',
        'INSTRUMENTAL',
        'ENDING',
        'CUSTOM'
    ) NOT NULL DEFAULT 'CUSTOM',
    custom_part_name VARCHAR(100) NULL,
    repeat_count TINYINT UNSIGNED NOT NULL DEFAULT 1,
    note VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_part_order (team_song_id, part_order),
    INDEX idx_team_song (team_song_id),
    FOREIGN KEY (team_song_id) REFERENCES team_songs (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '곡의 Song Form 파트 단위 정보';

-- ---------------------------------------------------------------------------
-- 7. 콘티
-- ---------------------------------------------------------------------------
CREATE TABLE contis (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    team_id BINARY(16) NOT NULL,
    created_by BINARY(16) NOT NULL,
    worship_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    memo TEXT NULL,
    status ENUM(
        'DRAFT',
        'PUBLISHED',
        'ARCHIVED'
    ) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    published_at DATETIME(3) NULL DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_team_date_status (
        team_id,
        worship_date DESC,
        status
    ),
    FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '예배 콘티';

-- ---------------------------------------------------------------------------
-- 8. 콘티 곡
-- ---------------------------------------------------------------------------
CREATE TABLE conti_songs (
    id BINARY(16) NOT NULL COMMENT 'UUID',
    conti_id BINARY(16) NOT NULL,
    order_index INT NOT NULL COMMENT '콘티 내 순서',
    team_song_id BINARY(16) NULL,
    custom_title VARCHAR(200) NULL,
    key_override VARCHAR(20) NULL,
    bpm_override INT NULL,
    note TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_conti_order (conti_id, order_index),
    FOREIGN KEY (conti_id) REFERENCES contis (id) ON DELETE CASCADE,
    FOREIGN KEY (team_song_id) REFERENCES team_songs (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '콘티 내 곡';

SET FOREIGN_KEY_CHECKS = 1;