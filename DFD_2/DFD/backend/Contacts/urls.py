from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()

router.register('accepted', views.UserContactsAccepted, "contacts_accepted")
router.register ('pending-sent', views.UserContactsPendingSent, 'contacts_pending_sent')
router.register ('pending-received', views.UserContactsPendingReceived, 'contacts_pending_received')
router.register('search',views.UsersContactsNotSent, 'contacts_search')
router.register('', views.ContactViewSet)
urlpatterns = [
    path('', include(router.urls))
]
