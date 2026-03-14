"""WSGI config for CoreInventory project."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core_inventory.settings")
application = get_wsgi_application()
