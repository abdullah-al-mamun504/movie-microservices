import os
import redis
import logging
from logging.config import dictConfig

def get_redis_client():
    """
    Get Redis client instance.
    """
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
    return redis.from_url(redis_url)

def setup_logging():
    """
    Setup logging configuration.
    """
    log_level = os.getenv("LOG_LEVEL", "INFO")
    
    # Convert string log level to logging constant
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f'Invalid log level: {log_level}')
    
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "stream": "ext://sys.stdout"
            }
        },
        "loggers": {
            "": {
                "handlers": ["console"],
                "level": numeric_level
            }
        }
    }
    dictConfig(logging_config)
