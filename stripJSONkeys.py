import json

# Load the JSON file
with open('score83024.json', 'r') as file:
    data = json.load(file)

# Keys to keep
keys_to_keep = {"time", "duration", "midi"}

# Function to filter the dictionary
def filter_keys(obj):
    return {key: obj[key] for key in keys_to_keep if key in obj}

# Iterate over each object (soprano, alto, tenor, bari)
for section in ['soprano', 'alto', 'tenor', 'bari']:
    data[section] = [filter_keys(item) for item in data[section]]

# Save the modified JSON back to a file
with open('filtered_file.json', 'w') as file:
    json.dump(data, file, indent=4)