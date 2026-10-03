"""
Waypoint Allocation Engine Structured Logging
Standardized logger instance for microservice event tracing.
"""

import logging
import sys

def get_logger(name: str = "waypoint.allocation") -> logging.Logger:
    """
    Returns configured logger with standardized formatting.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%SZ"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

log = get_logger()
