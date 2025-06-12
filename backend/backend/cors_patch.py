# Allow CORS for local frontend
CORS_ALLOW_ALL_ORIGINS = True

INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware'] + MIDDLEWARE
