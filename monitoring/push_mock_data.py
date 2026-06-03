# Mock Data Generator for InfluxDB (Ministry of ICT NetMon)
# Usage: python push_mock_data.py

import requests
import time
import random

INFLUX_URL = "http://localhost:8086"
ORG = "ict-netmon"
BUCKET = "network-metrics"
TOKEN = "ict-super-secret-influx-token"

def push_data(line_protocol):
    url = f"{INFLUX_URL}/api/v2/write?org={ORG}&bucket={BUCKET}"
    headers = {
        "Authorization": f"Token {TOKEN}",
        "Content-Type": "text/plain; charset=utf-8"
    }
    response = requests.post(url, headers=headers, data=line_protocol)
    if response.status_code == 204:
        print("Successfully pushed data.")
    else:
        print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    # Generate mock data for MikroTik
    ts = int(time.time())
    
    # SNMP System metrics
    cpu = random.uniform(10.0, 40.0)
    mem = random.uniform(200.0, 800.0)
    snmp_line = f"snmp,hostname=ict-mikrotik cpu_load={cpu:.2f},mem_used={mem:.2f},uptime=86400"
    
    # SNMP Interface metrics
    in_octets = random.randint(1000000, 5000000)
    out_octets = random.randint(500000, 2000000)
    if_line = f"interface,hostname=ict-mikrotik,ifDescr=eth0 ifInOctets={in_octets}i,ifOutOctets={out_octets}i"
    
    push_data("\n".join([snmp_line, if_line]))
