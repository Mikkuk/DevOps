import pika
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
import time

log_messages = []

class LogHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write('\n'.join(log_messages).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def start_http_server():
    server_address = ('', 8087)
    httpd = HTTPServer(server_address, LogHandler)
    httpd.serve_forever()
    print("server started")

def callback(ch, method, properties, body):
    # Callback function to handle RabbitMQ messages
    log_messages.append(body.decode('utf-8'))

def start_rabbitmq_listener():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='message-broker'))
    channel = connection.channel()
    channel.exchange_declare(exchange='log', exchange_type='fanout')
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange='log', queue=queue_name)
    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    print('Monitor service is waiting for log messages...')
    channel.start_consuming()

if __name__ == '__main__':
    # Start HTTP server and RabbitMQ listener in separate threads
    http_server_thread = threading.Thread(target=start_http_server)
    rabbitmq_listener_thread = threading.Thread(target=start_rabbitmq_listener)

    http_server_thread.daemon = True
    rabbitmq_listener_thread.daemon = True

    http_server_thread.start()
    rabbitmq_listener_thread.start()
    
    while True:
        time.sleep(1)