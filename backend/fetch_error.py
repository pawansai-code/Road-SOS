import urllib.request
import json
import re

url = 'https://road-sos-89oo.onrender.com/api/contacts/'
data = json.dumps({"contact_name": "Dad", "relationship": "Father", "phone_number": "99999999"}).encode('utf-8')
headers = {'X-Firebase-Uid': 'test_user_123', 'Content-Type': 'application/json'}

req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8')
    match = re.search(r'<div class="exception_value">(.*?)</div>', html, re.DOTALL)
    if match:
        print("Error Value:", match.group(1).strip())
    else:
        print("HTML (first 1000 chars):", html[:1000])
