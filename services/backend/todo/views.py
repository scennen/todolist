import os
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from dotenv import load_dotenv
from openai import OpenAI
from .models import Task, Category, Priority, Status
from .serializers import (
    TaskSerializer,
    CategorySerializer,
    PrioritySerializer,
    StatusSerializer,
    UserSerializer,
)
from typing import List
from pydantic import BaseModel, Field
from rest_framework.permissions import AllowAny, IsAuthenticated
from datetime import datetime
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from rest_framework.decorators import action

load_dotenv()

logger = logging.getLogger(__name__)

# Глобальный system prompt (можно заменить на строку или чтение из файла)
SYSTEM_PROMPT = (
    "Ты — ассистент по генерации задач для пользователя. "
    "Твоя задача — по тексту пользователя создавать список задач с корректными датами дедлайна. "
    "Правила для выставления дат:\n"
    "1. Если в задаче есть слова 'срочно', 'сегодня', 'немедленно', 'как можно скорее', 'ASAP', 'urgent', 'today' — ставь дедлайн сегодняшней датой (используй текущую дату).\n"
    "2. Если в задаче есть слова 'не срочно', 'когда-нибудь', 'можно потом', 'not urgent', 'someday', 'later' — ставь дедлайн через 7 дней от текущей даты.\n"
    "3. Если в задаче явно указана дата (например, 'до 25 июня', 'к 01.07.2025', 'by June 25', 'by 2025-07-01'), используй именно эту дату как дедлайн.\n"
    "4. Если в задаче нет явных указаний на срочность или дату, ставь дедлайн через 3 дня от текущей даты.\n"
    "5. Формат даты всегда ГГГГ-ММ-ДД (например, 2025-06-21).\n"
    "6. Не придумывай несуществующие даты, всегда опирайся на правила выше и текущую дату.\n"
    "7. Если задача на сегодня — дедлайн должен быть именно сегодняшней датой.\n"
    "8. Если задача на завтра — дедлайн должен быть на следующий день.\n"
    "9. Если задача на выходные — выбери ближайшую субботу или воскресенье.\n"
    "10. Если задача на рабочий день — выбери ближайший будний день.\n"
    "11. Не допускай дедлайнов в прошлом.\n"
    "12. Если задача повторяющаяся — ставь ближайший корректный дедлайн.\n"
    "13. Если задача зависит от другой — дедлайн должен быть позже дедлайна зависимой задачи.\n"
    "14. Если задача на конкретный день недели — вычисли ближайший такой день.\n"
    "15. Если задача на месяц/год — ставь последний день месяца/года.\n"
    "16. Если задача с формулировкой 'каждый день/неделю/месяц' — ставь ближайшую дату, а не сегодняшнюю.\n"
    "17. Если задача с формулировкой 'до конца недели/месяца/года' — вычисли соответствующую дату.\n"
    "18. Если задача с формулировкой 'через X дней/недель/месяцев' — вычисли дату от текущей.\n"
    "19. Не допускай дедлайнов на несуществующие даты (например, 31 февраля).\n"
    "20. Если задача не имеет смысла (пустая, бессмысленная) — не добавляй её.\n"
    "21. Если задача уже просрочена — выставь дедлайн на ближайшую возможную дату.\n"
    "22. Если задача на праздник/выходной — ставь ближайший рабочий день (или наоборот, если явно указано).\n"
    "23. Если задача с несколькими датами — выбирай наиболее раннюю, если не указано иное.\n"
    "24. Если задача с приоритетом — дедлайн должен быть раньше для high, позже для low.\n"
    "25. Если задача с формулировкой 'до конца дня' — дедлайн сегодня.\n"
    "26. Если задача с формулировкой 'до конца рабочего дня' — дедлайн сегодня, если сегодня будний день, иначе — ближайший будний.\n"
    "Учитывай все форматы дат (словесные, цифровые, разные языки).\n"
    "Возвращай задачи в виде списка с полями: title, description, due_date (ГГГГ-ММ-ДД), priority (high/medium/low)."
)

# Настройка клиента Mistral
client = OpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=os.environ.get("MISTRAL_API_KEY"),
)

@method_decorator(csrf_exempt, name='dispatch')
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        User = get_user_model()
        user = self.request.user
        if user.is_authenticated:
            qs = Task.objects.filter(user=user)
        else:
            anonymous_user, _ = User.objects.get_or_create(email="anonymous")
            qs = Task.objects.filter(user=anonymous_user)
        # Для list фильтруем только не удалённые
        if self.action == 'list':
            return qs.filter(deleted=False)
        return qs

    def perform_create(self, serializer):
        User = get_user_model()
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            user, _ = User.objects.get_or_create(email="anonymous")
        serializer.save(user=user)

    def create(self, request, *args, **kwargs):
        logger.info('POST /api/tasks/ - data: %s', request.data)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Используем perform_create для сохранения с user
                self.perform_create(serializer)
                logger.info('Task created: %s', serializer.instance)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error('Error creating task: %s', str(e))
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            logger.error('Task creation failed: %s', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.deleted:
            instance.delete()
        else:
            instance.deleted = True
            instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='deleted')
    def deleted_tasks(self, request):
        User = get_user_model()
        user = request.user
        if user.is_authenticated:
            qs = Task.objects.filter(user=user, deleted=True)
        else:
            anonymous_user, _ = User.objects.get_or_create(email="anonymous")
            qs = Task.objects.filter(user=anonymous_user, deleted=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PriorityViewSet(viewsets.ModelViewSet):
    queryset = Priority.objects.all()
    serializer_class = PrioritySerializer

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

# Pydantic-модель для задачи
class AITask(BaseModel):
    id: str = Field(..., description="ID задачи")
    description: str = Field(..., description="Заголовок задачи")
    time_estimate: str = Field(..., description="Время на выполнение задачи")
    priority: str = Field(..., description="Приоритет задачи")
    status: str = Field(..., description="Статус задачи")

# Pydantic-модель для проекта (списка задач)
class Project(BaseModel):
    tasks: List[AITask] = Field(..., description="Список задач")

@method_decorator(csrf_exempt, name="dispatch")
class MistralView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def options(self, request, *args, **kwargs):
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    def post(self, request):
        logger.info("MistralView POST called")
        try:
            # Проверяем наличие API ключа
            api_key = os.environ.get("MISTRAL_API_KEY")
            if not api_key:
                error_msg = "MISTRAL_API_KEY не найден в переменных окружения"
                logger.error(error_msg)
                return Response({'error': error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            logger.info("MISTRAL_API_KEY найден")

            # Получаем system prompt из загруженного файла
            if 'file' not in request.FILES:
                error_msg = 'Файл не загружен'
                logger.error(error_msg)
                return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)
            
            file = request.FILES['file']
            logger.info(f"Получен файл: {file.name}, размер: {file.size} байт")
            # Проверяем размер файла (максимум 1MB)
            if file.size > 1024 * 1024:
                return Response({'error': 'Файл слишком большой'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Проверяем тип файла
            if not file.name.endswith(('.txt', '.md')):
                return Response({'error': 'Неподдерживаемый формат файла'}, status=status.HTTP_400_BAD_REQUEST)

            now_str = datetime.now().strftime('%Y-%m-%d %H:%M')
            system_prompt = (
                "Ты — помощник по генерации задач. Проанализируй язык входного текста и верни JSON на том же языке.\n"
                "Формат JSON:\n"
                "{\n"
                '  "tasks": [\n'
                "    {\n"
                '      "id": "1",\n'
                '      "description": "Описание задачи на том же языке, что и входной текст",\n'
                '      "time_estimate": "2h",\n'
                '      "priority": "high/medium/low или высокий/средний/низкий",\n'
                '      "status": "todo/in progress/done или новая/в работе/завершена",\n'
                '      "deadline": "2024-06-12"\n'
                "    }\n"
                "  ]\n"
                "}\n"
                f"Для каждой задачи оцени время на выполнение (time_estimate) и выставь реальный дедлайн (deadline, ISO-формат YYYY-MM-DD) исходя из текущей даты и времени загрузки задачи пользователем: {now_str}. ВАЖНО: дедлайн каждой задачи должен быть не менее чем через 7 дней от текущей даты. Проанализируй зависимости между задачами и выставляй дедлайны так, чтобы не было задач с дедлайном менее недели. Если задача зависит от других, дедлайн должен быть позже их дедлайна.\n"
                "Дополнительные строгие правила по дедлайнам:\n"
                "- Не допускай дедлайнов в прошлом.\n"
                "- Если задача повторяющаяся — ставь ближайший корректный дедлайн.\n"
                "- Если задача зависит от другой — дедлайн должен быть позже дедлайна зависимой задачи.\n"
                "- Если задача на конкретный день недели — вычисли ближайший такой день.\n"
                "- Если задача на месяц/год — ставь последний день месяца/года.\n"
                "- Если задача с формулировкой 'каждый день/неделю/месяц' — ставь ближайшую дату, а не сегодняшнюю.\n"
                "- Если задача с формулировкой 'до конца недели/месяца/года' — вычисли соответствующую дату.\n"
                "- Если задача с формулировкой 'через X дней/недель/месяцев' — вычисли дату от текущей.\n"
                "- Не допускай дедлайнов на несуществующие даты (например, 31 февраля).\n"
                "- Если задача не имеет смысла (пустая, бессмысленная) — не добавляй её.\n"
                "- Если задача уже просрочена — выставь дедлайн на ближайшую возможную дату.\n"
                "- Если задача на праздник/выходной — ставь ближайший рабочий день (или наоборот, если явно указано).\n"
                "- Если задача с несколькими датами — выбирай наиболее раннюю, если не указано иное.\n"
                "- Если задача с приоритетом — дедлайн должен быть раньше для high, позже для low.\n"
                "- Если задача с формулировкой 'до конца дня' — дедлайн сегодня.\n"
                "- Если задача с формулировкой 'до конца рабочего дня' — дедлайн сегодня, если сегодня будний день, иначе — ближайший будний.\n"
                "- Учитывай все форматы дат (словесные, цифровые, разные языки).\n"
            )

            # Используем содержимое файла как user_message
            text = file.read().decode('utf-8', errors='ignore')
            user_message = text

            # Запрос к Mistral
            try:
                completion = client.chat.completions.create(
                    model="mistral-large-2411",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    response_format={"type": "json_object"}
                )
                content = completion.choices[0].message.content
                print("Ответ Mistral:", content)
            except Exception as e:
                print(f"Ошибка при обращении к Mistral: {e}")
                logger.error(f"Ошибка при обращении к Mistral: {e}")
                return Response({"error": "Ошибка при обращении к AI", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            import json
            User = get_user_model()
            if hasattr(request, 'user') and request.user and request.user.is_authenticated:
                user = request.user
            else:
                user, _ = User.objects.get_or_create(email="anonymous")
            try:
                project_data = json.loads(content)
                # --- Маппинг приоритетов ---
                priority_map = {p.name.lower(): p.id for p in Priority.objects.all()}
                # Поддержка и английских, и русских названий, если нужно
                aliases = {
                    'high': 'high', 'высокий': 'high',
                    'medium': 'medium', 'средний': 'medium',
                    'low': 'low', 'низкий': 'low',
                }
                # --- Маппинг статусов ---
                status_map = {s.name.lower(): s.id for s in Status.objects.all()}
                status_aliases = {
                    'todo': 'новая', 'to do': 'новая', 'новая': 'новая',
                    'in progress': 'в работе', 'в работе': 'в работе', 'doing': 'в работе',
                    'done': 'завершена', 'completed': 'завершена', 'завершена': 'завершена',
                }
                for task in project_data.get('tasks', []):
                    prio_str = str(task.get('priority', '')).lower()
                    prio_key = aliases.get(prio_str, prio_str)
                    task['priority'] = priority_map.get(prio_key, list(priority_map.values())[0])
                    # обработка статуса
                    status_str = str(task.get('status', '')).lower()
                    status_key = status_aliases.get(status_str, status_str)
                    task['status'] = status_map.get(status_key, list(status_map.values())[0])
                # --- конец маппинга ---
                # Сохраняем задачи в базу данных
                created_tasks = []
                for task in project_data.get('tasks', []):
                    task_obj = Task.objects.create(
                        title=task.get('description', ''),
                        description=task.get('description', ''),
                        priority_id=task.get('priority'),
                        status_id=task.get('status'),
                        due_date=task.get('deadline'),
                        user=user,
                        project="Сегодня",
                        deleted=False
                        # Добавьте другие нужные поля, если есть
                    )
                    created_tasks.append(task_obj)
                return Response(TaskSerializer(created_tasks, many=True).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Ошибка парсинга ответа Mistral: {e}")
                logger.error(f"Ошибка парсинга ответа Mistral: {e}")
                return Response({"error": "Ошибка парсинга ответа от AI", "details": str(e), "raw": content}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Ошибка при обработке запроса: {e}")
            logger.error(f"Ошибка при обработке запроса: {e}")
            return Response({"error": "Ошибка при обработке запроса", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'id': user.id, 'email': user.email}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
