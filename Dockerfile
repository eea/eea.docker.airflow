FROM apache/airflow:2.0.2

RUN pip install 'elasticsearch>=7.0.0,<8.0.0'
RUN pip install eea.rabbitmq.client

ADD ./docker_start.sh /

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/docker_start.sh"]