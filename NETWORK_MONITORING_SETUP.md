# Ministry of ICT NetMon – Network Integration Configuration Guide

> **Target Environment**: Ministry of ICT national network.
> **Monitoring Server IP**: `10.0.0.100` (replace with your actual server IP)
> **SNMPv3 User**: `ict_monitor`
> **SNMP Community (v2c fallback)**: `ict-netmon-ro`
> **Syslog Port**: UDP 514 | **NetFlow Port**: UDP 2055 | **sFlow Port**: UDP 6343

---

## 1. Logical Network Diagram

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                   Ministry of ICT Network                            │
  │                                                                      │
  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
  │  │  MikroTik   │     │  Cisco IOS  │     │ Huawei VRP  │           │
  │  │   Router    │     │   Router    │     │   Router    │           │
  │  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘           │
  │         └───────────────────┼───────────────────┘                  │
  │                             │                                       │
  │                    ┌────────▼────────┐                              │
  │                    │  Core / Distrib │                              │
  │                    │     Switch      │                              │
  │                    └────────┬────────┘                              │
  │              ┌──────────────▼──────────────┐                       │
  │              │   Monitoring Server (Linux)  │  10.0.0.100          │
  │              │  Telegraf │ nfdump │ rsyslog │  (SNMP+Flow+Syslog) │
  │              │  InfluxDB │ Grafana          │  (TSDB + Dashboard) │
  │              └─────────────────────────────┘                       │
  │  Data Flows:                                                         │
  │    SNMP Polls ──► UDP 161  ──► Routers (Telegraf pulls)            │
  │    NetFlow    ──► UDP 2055 ──► Server (pushed by routers)          │
  │    sFlow      ──► UDP 6343 ──► Server                              │
  │    Syslog     ──► UDP 514  ──► Server                              │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Router Configuration

### 2.1 MikroTik RouterOS

> RouterOS v7.x – via Winbox terminal or SSH.

#### Step 1 – NTP Client
```routeros
/system ntp client
set enabled=yes servers=10.0.0.100
```

#### Step 2 – SNMPv3
```routeros
/snmp community
add name=ict-netmon-v3 \
    authentication-protocol=SHA1 \
    authentication-password=StrongAuth@ICT! \
    encryption-protocol=AES128 \
    encryption-password=StrongEncr@ICT! \
    security=private \
    addresses=10.0.0.100/32

/snmp
set enabled=yes contact="network@ict.gov.zw" location="Ministry HQ" \
    trap-community=ict-netmon-v3
```

#### Step 3 – IPFIX (Traffic Flow)
```routeros
/ip traffic-flow
set enabled=yes interfaces=all active-flow-timeout=1m inactive-flow-timeout=15s

/ip traffic-flow target
add dst-address=10.0.0.100 port=2055 version=ipfix
```

#### Step 4 – Syslog
```routeros
/system logging action
add name=syslog-server target=remote remote=10.0.0.100 remote-port=514 \
    bsd-syslog=yes syslog-facility=daemon

/system logging
add topics=info     action=syslog-server
add topics=warning  action=syslog-server
add topics=error    action=syslog-server
add topics=critical action=syslog-server
```

#### Step 5 – Firewall (ACL)
```routeros
/ip firewall filter
add chain=input protocol=udp dst-port=161 src-address=10.0.0.100 action=accept \
    comment="Allow SNMP from monitoring server"
add chain=input protocol=udp dst-port=161 action=drop \
    comment="Block unauthorized SNMP"
```

#### Step 6 – Verify
```routeros
/snmp print
/ip traffic-flow print
/ip traffic-flow target print
/system logging action print
```

---

### 2.2 Cisco IOS

> Cisco IOS 15.x / IOS-XE – privileged EXEC mode.

#### Step 1 – NTP
```cisco
conf t
ntp server 10.0.0.100 prefer
ntp update-calendar
end
```

#### Step 2 – SNMPv3
```cisco
conf t
snmp-server group ICT_MONITOR_GRP v3 priv
snmp-server user ict_monitor ICT_MONITOR_GRP v3 \
  auth sha StrongAuth@ICT! \
  priv aes 128 StrongEncr@ICT!
snmp-server location "Ministry HQ"
snmp-server contact network@ict.gov.zw
snmp-server host 10.0.0.100 version 3 priv ict_monitor
end
```

#### Step 3 – NetFlow
```cisco
conf t
interface GigabitEthernet0/0
 ip flow ingress
 ip flow egress
!
ip flow-export destination 10.0.0.100 2055
ip flow-export version 9
ip flow-export source GigabitEthernet0/0
ip flow-cache timeout active 1
ip flow-cache timeout inactive 15
end
```

#### Step 4 – Syslog
```cisco
conf t
logging trap informational
logging host 10.0.0.100 transport udp port 514
logging facility local7
logging on
end
```

#### Step 5 – ACL for SNMP
```cisco
conf t
ip access-list standard SNMP_ACCESS
 10 permit 10.0.0.100
 20 deny any log
snmp-server community ict-netmon-ro RO SNMP_ACCESS
end
```

#### Step 6 – Verify
```cisco
show snmp
show snmp user
show ip flow export
show ip cache flow
show ntp status
show logging
```

---

### 2.3 Huawei VRP

> VRP 5.x / 8.x (AR series, S series).

#### Step 1 – NTP
```vrp
system-view
ntp-service unicast-server 10.0.0.100 preference
ntp-service enable
quit
```

#### Step 2 – SNMPv3
```vrp
system-view
snmp-agent
snmp-agent sys-info version v3
snmp-agent usm-user v3 ict_monitor \
  authentication-mode sha StrongAuth@ICT! \
  privacy-mode aes128 StrongEncr@ICT!
snmp-agent sys-info contact network@ict.gov.zw
snmp-agent sys-info location "Ministry HQ"
snmp-agent target-host trap-hostname ict-monitor address udp-domain 10.0.0.100 \
  udp-port 162 params securityname ict_monitor v3 privacy
quit
```

#### Step 3 – NetStream (Flow)
```vrp
system-view
ip netstream timeout active 1
ip netstream timeout inactive 15
ip netstream export version 9
ip netstream export host 10.0.0.100 2055
ip netstream export source GigabitEthernet0/0/0
interface GigabitEthernet0/0/0
 ip netstream inbound
 ip netstream outbound
quit
```

#### Step 4 – Syslog
```vrp
system-view
info-center enable
info-center loghost 10.0.0.100 facility local7
info-center source default channel loghost log level informational
quit
```

#### Step 5 – ACL for SNMP
```vrp
system-view
acl number 2001
 rule 5 permit source 10.0.0.100 0
 rule 100 deny source any
snmp-agent community read ict-netmon-ro acl 2001
quit
```

#### Step 6 – Verify
```vrp
display snmp-agent sys-info
display snmp-agent usm-user
display ip netstream export
display ntp-service status
display logbuffer
```

---

## 3. Monitoring Server Setup (Docker on Windows)

> **Requirements**: Docker Desktop for Windows with WSL2 backend.
> Download: https://www.docker.com/products/docker-desktop/
> All config files are in `monitoring/` within the project.

### 3.1 Find Your Windows Server IP

```powershell
# Run in PowerShell – find your LAN IP to give to routers
ipconfig | findstr "IPv4"
# Use this IP (e.g. 192.168.1.100) as the monitoring server IP in all router configs
```

### 3.2 Windows Firewall – Open Required Ports

```powershell
# Run in PowerShell (as Administrator)
New-NetFirewallRule -DisplayName "SNMP"    -Direction Inbound -Protocol UDP -LocalPort 161  -Action Allow
New-NetFirewallRule -DisplayName "NetFlow" -Direction Inbound -Protocol UDP -LocalPort 2055 -Action Allow
New-NetFirewallRule -DisplayName "sFlow"   -Direction Inbound -Protocol UDP -LocalPort 6343 -Action Allow
New-NetFirewallRule -DisplayName "Syslog"  -Direction Inbound -Protocol UDP -LocalPort 514  -Action Allow
New-NetFirewallRule -DisplayName "Grafana" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "InfluxDB"-Direction Inbound -Protocol TCP -LocalPort 8086 -Action Allow
```

### 3.3 Edit Router IPs in Telegraf Config

Open `monitoring\telegraf\telegraf.conf` and update the `agents` list with your real router IPs:

```toml
agents = [
  "udp://192.168.1.1:161",   # MikroTik Router
  "udp://192.168.1.2:161",   # Cisco Router
  "udp://192.168.1.3:161",   # Huawei Router
]
```

### 3.4 Start the Monitoring Stack

```powershell
# From the project root
cd "m:\PROJECTS\Ministry of ICT NetMon"

# Pull images and start all containers
docker compose up -d

# Verify all containers are running
docker compose ps
```

Expected running containers:

| Container | Purpose | Port |
|-----------|---------|------|
| `ict_influxdb` | Time-series database | 8086 |
| `ict_telegraf` | SNMP poller | (outbound only) |
| `ict_nfcapd` | NetFlow / IPFIX collector | UDP 2055, 6343 |
| `ict_syslog` | Syslog receiver | UDP 514 |
| `ict_grafana` | Dashboard & alerting | 3000 |

### 3.5 Access the Services

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| Grafana | http://localhost:3000 | admin / IctGrafana@2026! |
| InfluxDB | http://localhost:8086 | admin / IctAdmin@2026! |

**Grafana post-start steps:**
1. Login → Grafana auto-provisions InfluxDB as a data source (via `provisioning/datasources/influxdb.yml`)
2. **Import Dashboards** → `+` → Import → Enter ID `13580` (SNMP Interface Stats) or `10949` (Network Device Stats)
3. **Create Alert Rules** via Alerting → Alert Rules:

| Alert Name | Condition | Duration | Severity |
|------------|-----------|----------|----------|
| High Bandwidth | ifInOctets / ifOutOctets > 80% capacity | 5 min | Warning |
| Interface Down | ifOperStatus ≠ 1 | 1 min | Critical |
| High CPU | cpu_load > 85% | 10 min | Warning |
| Traffic Spike | rate(ifInOctets[5m]) > 2× baseline | 3 min | Warning |

### 3.6 Useful Docker Management Commands

```powershell
# View logs from all containers
docker compose logs -f

# View logs from a specific container
docker compose logs -f telegraf
docker compose logs -f ict_syslog

# Restart a single service
docker compose restart telegraf

# Stop the entire stack
docker compose down

# Stop and remove all data (full reset)
docker compose down -v
```

---

## 4. Verification Steps

### 4.1 Ping Connectivity
```bash
ping -c 4 192.168.1.1   # MikroTik
ping -c 4 192.168.1.2   # Cisco
ping -c 4 192.168.1.3   # Huawei
```

### 4.2 SNMP Walk Test
```bash
snmpwalk -v3 -l authPriv \
  -u ict_monitor \
  -a SHA -A "StrongAuth@ICT!" \
  -x AES -X "StrongEncr@ICT!" \
  192.168.1.1 sysDescr
```

### 4.3 Flow Data Check
```bash
# Watch for incoming flow packets
tcpdump -i any udp port 2055 -c 10

# Inspect captured flow files
ls -lh /var/netflow/
nfdump -r /var/netflow/nfcapd.$(date +%Y%m%d%H%M) -s IP/bytes
```

### 4.4 Syslog Check
```bash
tail -f /var/log/routers/192.168.1.1.log
```

### 4.5 InfluxDB Data Check
```bash
influx query '
from(bucket: "network-metrics")
  |> range(start: -15m)
  |> filter(fn: (r) => r._measurement == "interface")
  |> limit(n: 5)
'
```

---

## 5. Troubleshooting Guide

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `snmpwalk` times out | UDP 161 blocked | Check router ACL and `ufw status` on server |
| SNMPv3 auth error | Algorithm or password mismatch | Ensure `auth_protocol`/`priv_protocol` match on both router and Telegraf |
| No flow data received | Wrong export IP or port on router | Verify export destination; run `tcpdump` on UDP 2055 |
| Missing syslog entries | rsyslog UDP not enabled | Check `/etc/rsyslog.conf` for `imudp`; run `rsyslogd -N1` to test |
| Telegraf shows "no data" | InfluxDB token/bucket mismatch | Verify token, org, and bucket name in `telegraf.conf` |
| High router CPU | Poll interval too short | Increase `interval` to `120s` in Telegraf |
| Grafana panels empty | Data source not configured | Re-test data source in Grafana settings |
| Time drift in logs | NTP not synced | Run `show ntp status`; ensure UDP 123 is not blocked |
| Duplicate flow records | Flow timeout too short | Increase `active-flow-timeout` to 5m on router |

---

## 6. Scalability Notes

- **Multi-campus**: Add additional router IPs per site under `[[inputs.snmp]]`; tag by `campus`.
- **InfluxDB**: Use 90-day raw data retention + downsampling tasks for long-term trend storage.
- **Grafana**: Use template variables (`$campus`, `$router`) to build a single dynamic dashboard across all sites.
- **Performance**: SNMPv3 polling adds <1% router CPU at 60s poll intervals; NetFlow export adds <2%.

---

## 7. Security Checklist

- [ ] Use SNMPv3 `authPriv` on all routers
- [ ] Restrict SNMP via ACL to monitoring server IP only
- [ ] Disable SNMPv1/v2c where no legacy device requires it
- [ ] Use a dedicated management VLAN for monitoring traffic
- [ ] Enable HTTPS on Grafana in production
- [ ] Rotate SNMP credentials every 90 days
- [ ] Store credentials in environment variables or a secrets manager
