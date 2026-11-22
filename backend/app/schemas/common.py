from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Python uses snake_case, the React app uses camelCase.

    This base class lets the API accept and return camelCase JSON
    (e.g. fullName, clinicId) while the Python code keeps snake_case.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
