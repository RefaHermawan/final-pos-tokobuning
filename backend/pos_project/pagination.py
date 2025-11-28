# pos_project/pagination.py

from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Ukuran halaman default
    page_size_query_param = 'page_size' # Parameter untuk override (cth: ?page_size=100)
    max_page_size = 100000 # Batas maksimal yang diizinkan