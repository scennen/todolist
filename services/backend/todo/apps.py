from django.apps import AppConfig


class TodoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'todo'

    def ready(self):
        from django.db.utils import OperationalError
        try:
            from .models import Priority, Status
            if not Priority.objects.exists():
                Priority.objects.create(name="high", color="#ff0000")
                Priority.objects.create(name="medium", color="#ffa500")
                Priority.objects.create(name="low", color="#00ff00")
            if not Status.objects.exists():
                Status.objects.create(name="новая")
                Status.objects.create(name="в работе")
                Status.objects.create(name="завершена")
        except OperationalError:
            # База может быть не готова при миграциях
            pass
