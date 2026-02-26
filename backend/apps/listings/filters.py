import django_filters
from .models import Listing


class ListingFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(lookup_expr="icontains")
    model = django_filters.CharFilter(lookup_expr="icontains")
    condition = django_filters.MultipleChoiceFilter(choices=Listing.Condition.choices)
    movement_type = django_filters.MultipleChoiceFilter(choices=Listing.MovementType.choices)
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    city = django_filters.CharFilter(field_name="location_city", lookup_expr="icontains")
    country = django_filters.CharFilter(field_name="location_country", lookup_expr="icontains")
    year_min = django_filters.NumberFilter(field_name="year", lookup_expr="gte")
    year_max = django_filters.NumberFilter(field_name="year", lookup_expr="lte")

    class Meta:
        model = Listing
        fields = [
            "brand", "model", "condition", "movement_type",
            "min_price", "max_price", "city", "country",
            "year_min", "year_max",
        ]
