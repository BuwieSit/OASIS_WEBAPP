// export const USER_REGEX = /^[a-zA-Z0-9.]+@iskolarngbayan\.pup\.edu\.ph$/i;
export const USER_REGEX = /^[a-zA-Z0-9.@]+@iskolarngbayan\.pup\.edu\.ph$/i;

export const PWD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#\-_\/()])[A-Za-z\d@$!%*?&.,#\-_\/()]{8,}$/;

export const ADMIN_REGEX = /^(admin\d{3}|[a-zA-Z0-9.@_]+@oasis\.com)$/i;

export const OTP_REGEX = /^\d{6}$/;