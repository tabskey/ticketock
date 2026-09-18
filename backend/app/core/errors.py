class AppError(Exception):
    code: str = "ERROR"
    status_code: int = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class UnauthorizedError(AppError):
    code = "UNAUTHORIZED"
    status_code = 401


class ForbiddenError(AppError):
    code = "FORBIDDEN"
    status_code = 403


class TicketNotFoundError(AppError):
    code = "TICKET_NOT_FOUND"
    status_code = 404


class InvalidStatusTransitionError(AppError):
    code = "INVALID_STATUS_TRANSITION"
    status_code = 422
