from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langgraph_supervisor import create_supervisor


def book_hotel(hotel_name: str):
    """Book a hotel"""
    return f"Successfully booked a stay at {hotel_name}."


def book_flight(from_airport: str, to_airport: str):
    """Book a flight"""
    return f"Successfully booked a flight from {from_airport} to {to_airport}."


flight_assistant = create_react_agent(
    name="flight_assistant",
    model="openai:gpt-4o",
    tools=[book_flight],
    prompt="You are a flight booking assistant",
)

hotel_assistant = create_react_agent(
    name="hotel_assistant",
    model="openai:gpt-4o",
    tools=[book_hotel],
    prompt="You are a hotel booking assistant",
)

supervisor = create_supervisor(
    model=ChatOpenAI(model="openai:gpt-4o"),
    agents=[flight_assistant, hotel_assistant],
    prompt=(
        "You manage a hotel booking assistant and a"
        "flight booking assistant. Assign work to them."
    ),
    add_handoff_back_messages=True,
    output_mode="full_history"
).compile()

for chunk in supervisor.stream(
    {
        "messages": [
            {
                "role": "user",
                "content": "Book a flight from Kolkata to Ahmedabad and a stay at The Ummed Ahmedabad Hotel"
            }
        ]
    }
):
    print(chunk)
    print("\n")
