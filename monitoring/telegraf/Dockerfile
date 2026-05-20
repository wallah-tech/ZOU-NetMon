FROM telegraf:1.30-alpine
USER root
RUN apk update && apk add --no-network --allow-untrusted || apk update
RUN apk add --no-cache net-snmp-tools net-snmp-mibs
USER telegraf
