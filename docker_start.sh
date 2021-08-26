#!/bin/bash

chown airflow:airflow /opt/airflow/logs

if [[ -d "/custom_config" ]] && [[ "${DEV_ENV:-false}" != "true" ]]
then
    echo "/custom_config exists on your filesystem."
    rm -R /opt/airflow/dags
    ln -s /custom_config/dags /opt/airflow
fi

sed -i "s/sentry_on = false/sentry_on = true/g" /opt/airflow/airflow.cfg

exec airflow /entrypoint $1 $2 $3
