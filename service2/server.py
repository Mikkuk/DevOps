import time
import http.server
import socketserver
import pika
import threading

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        data = self.rfile.read(content_length).decode('utf-8')

        # Address of service 1
        remote_address = self.client_address[0] + ':' + str(self.client_address[1])
        log_entry = f"SND {data} {remote_address}"

        send_to_rabbitmq('log', log_entry)

        self.send_response(200)
        self.end_headers()

def send_to_rabbitmq(topic, message):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='message-broker'))
    channel = connection.channel()

    channel.exchange_declare(exchange=topic, exchange_type='fanout')

    channel.basic_publish(exchange=topic, routing_key='', body=message)
    print('log sent', message)

    connection.close()

def rabbitmq_listener():
    while True:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='message-broker'))
            channel = connection.channel()

            channel.exchange_declare(exchange='message', exchange_type='fanout')

            result = channel.queue_declare(queue='', exclusive=True)
            queue_name = result.method.queue

            channel.queue_bind(exchange='message', queue=queue_name)

            def callback(ch, method, properties, body):
                log_entry = f"SND {body.decode('utf-8')} MSG"
                send_to_rabbitmq('log', log_entry)

            channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

            print('Service 2 is waiting for messages...')
            channel.start_consuming()

        except Exception as e:
            print(f'Error connecting to RabbitMQ: {str(e)}')

# 2 second wait before server start
time.sleep(2)

# Start a thread for RabbitMQ listener
rabbitmq_thread = threading.Thread(target=rabbitmq_listener)
rabbitmq_thread.daemon = True
rabbitmq_thread.start()

with socketserver.TCPServer(('0.0.0.0', 8000), RequestHandler) as httpd:
    print('Service 2 is listening on port 8000')
    httpd.serve_forever()
