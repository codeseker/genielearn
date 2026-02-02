export const ERROR_MESSAGES: Record<string, string> = {
  INTERNAL_SERVER_ERROR:
    "Something went wrong on our side. Please try again in a moment.",

  PAGINATION_ERROR:
    "We couldn’t load more items right now. Please refresh and try again.",

  COURSE_PROMPT:
    "We couldn’t understand your course request. Try rephrasing it slightly.",

  COURSE_ID:
    "This course link looks invalid. Please check and try again.",

  COURSE_NOT_FOUND:
    "This course doesn’t exist or may have been removed.",

  COURSE_VIOLATION:
    "We couldn’t understand your course request. Try rephrasing it slightly.",

  MODULE_ID:
    "This module link looks invalid. Please try again.",

  MODULE_NOT_FOUND:
    "This module could not be found.",

  MODULE_VIOLATION:
    "You don’t have permission to access this module.",

  LESSON_ID:
    "This lesson link looks invalid.",

  LESSON_NOT_FOUND:
    "This lesson is no longer available.",

  LESSON_VIOLATION:
    "You’re not allowed to access this lesson.",

  USER_NOT_FOUND:
    "We couldn’t find an account with these details.",

  USER_EMAIL_EXISTS:
    "An account with this email already exists. Try logging in instead.",

  USER_EMAIL_NOT_FOUND:
    "No account found with this email address.",

  USER_PASSWORD_NOT_MATCH:
    "That password doesn’t look right. Please try again.",

  USER_ACCOUNT_INACTIVE:
    "Your account is currently inactive. Please contact support.",

  USER_ROLE_NOT_FOUND:
    "Your account permissions could not be verified.",

  REGISTER_VALIDATION:
    "Some required information is missing or invalid. Please review and try again.",

  LOGIN_VALIDATION:
    "Please enter a valid email and password.",

  AUTHORIZATION_CODE_MISSING:
    "Authorization failed. Please try again from the beginning.",

  TOKEN_NOT_FOUND:
    "Your session has ended. Please log in again.",

  TOKEN_INVALID:
    "Your session is invalid. Please log in again.",

  TOKEN_EXPIRED:
    "Your session has expired. Please log in again.",

  REFRESH_TOKEN_NOT_FOUND:
    "Your login session has ended. Please sign in again.",

  REFRESH_TOKEN_INVALID:
    "We couldn’t refresh your session. Please log in again.",

  REFRESH_TOKEN_EXPIRED:
    "Your session expired due to inactivity. Please log in again.",

  AVATAR_REQUIRED:
    "Please upload a profile picture to continue.",

  ONLY_IMAGES_ALLOWED:
    "Only image files are allowed. Please upload a valid image.",
};
