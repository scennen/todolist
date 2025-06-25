from django.apps import AppConfig


class TodoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'todo'

    # ready() больше не нужен, инициализация через signals.py
    # def ready(self):
    #     pass
