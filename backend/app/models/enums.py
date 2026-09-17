import enum


class UserRole(str, enum.Enum):
    EMPLOYEE = "employee"
    SUPPORT = "support"


class TicketCategory(str, enum.Enum):
    IT = "IT"
    FACILITIES = "Facilities"
    HR = "HR"


class TicketPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"


class TicketStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"
