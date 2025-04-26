from pydantic_extra_types.phone_numbers import PhoneNumber, PhoneNumberValidator
from typing_extensions import Annotated

IndianPhoneNumberType = Annotated[
    PhoneNumber,
    PhoneNumberValidator(
        default_region='IN',
        supported_regions=['IN'],
        number_format='RFC3966'
    )
]
