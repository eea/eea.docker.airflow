#!/bin/bash

if [[ -d "/custom_config" ]]
then
    echo "/custom_config exists on your filesystem."
    rm -R /opt/airflow/dags
    ln -s /custom_config/dags /opt/airflow
fi

/entrypoint $1 $2 $3