FROM apache/airflow:2.0.2

ADD ./requirements.txt /

RUN pip install -r /requirements.txt

ADD ./docker_start.sh /

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/docker_start.sh"]
