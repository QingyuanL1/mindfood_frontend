import base64
import os
file_name = os.path.basename(__file__)
user_input = input()
concatenated_string = user_input + file_name
encoded_string = base64.b64encode(concatenated_string.encode()).decode()
print(f"{encoded_string}")
