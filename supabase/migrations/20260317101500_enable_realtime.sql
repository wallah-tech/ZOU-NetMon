-- Enable real-time for all monitored tables
ALTER PUBLICATION supabase_realtime ADD TABLE alerts, traffic_data, anomalies, predictions, reports, routers;
