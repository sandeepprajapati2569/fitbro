from pydantic import BaseModel, field_validator
from typing import Literal


class GeneratePlanRequest(BaseModel):
    goal: Literal["lose_weight", "gain_weight"]
    current_weight: float
    target_weight: float
    weight_unit: Literal["kg", "lbs"]
    timeline_weeks: int
    gender: Literal["male", "female"]
    age: int
    height_cm: float
    activity_level: Literal[
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extra_active",
    ]

    @field_validator("current_weight", "target_weight")
    @classmethod
    def weight_range(cls, v: float) -> float:
        if v < 30 or v > 300:
            raise ValueError("Weight must be between 30 and 300")
        return v

    @field_validator("timeline_weeks")
    @classmethod
    def timeline_range(cls, v: int) -> int:
        if v < 1 or v > 104:
            raise ValueError("Timeline must be between 1 and 104 weeks")
        return v

    @field_validator("age")
    @classmethod
    def age_range(cls, v: int) -> int:
        if v < 13 or v > 100:
            raise ValueError("Age must be between 13 and 100")
        return v

    @field_validator("height_cm")
    @classmethod
    def height_range(cls, v: float) -> float:
        if v < 100 or v > 250:
            raise ValueError("Height must be between 100 and 250 cm")
        return v
