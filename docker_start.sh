#!/bin/bash

if [[ -d "/custom_config" ]] && [[ "${DEV_ENV:-false}" != "true" ]]
then
    echo "/custom_config exists on your filesystem."
    rm -R /opt/airflow/dags
    ln -s /custom_config/dags /opt/airflow
fi

if [[ -f /opt/airflow/airflow.cfg ]]
then
  sed -i "s/sentry_on = false/sentry_on = true/g" /opt/airflow/airflow.cfg
  sed -i "s/\[%%(asctime)s\]/\[%%(asctime)s.%%(msecs)03d\]/g" /opt/airflow/airflow.cfg
  sed -i "s/scheduler_heartbeat_sec = 5/scheduler_heartbeat_sec = 1/g" /opt/airflow/airflow.cfg
  sed -i "s/scheduler_idle_sleep_time = 1/scheduler_idle_sleep_time = 0.1/g" /opt/airflow/airflow.cfg
fi

gosu airflow /entrypoint $1 $2 $3
