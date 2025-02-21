import json

addr = set()

with open("addresses.jsonl", "r", encoding="utf-8") as file:
    for line in file:
        data = json.loads(line)
        addresses = data["bitcoin addresses"]

        for address in addresses:
            addr.add(address)

with open("btc_addr.json", "w", encoding="utf-8") as file:
    json.dump(list(addr), file)

print(addr, len(addr))

# Test reading json
# def load(file_path):
#     with open(file_path, "r", encoding="utf-8") as file:
#         return json.load(file)

# test = load("btc_addr.json")
# print(test)
# print(type(test))
# print(len(test))