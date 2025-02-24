from django.urls import path
from .views import get_all_addresses, get_transactions, get_transaction_graph, transaction_graph_page

urlpatterns = [
    path("addresses/", get_all_addresses, name="get_all_addresses"),
    path("transactions/<str:address>/", get_transactions, name="get_transactions"),
    path("graph_data/<str:address>/", get_transaction_graph, name="get_transaction_graph"),
    path("graph/", transaction_graph_page, name="transaction_graph_page"),
]
