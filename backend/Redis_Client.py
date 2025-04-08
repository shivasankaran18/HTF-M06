import redis
import json

redis_host="localhost"
redis_port=6379


redis_client=redis.StrictRedis(host=redis_host, port=redis_port, decode_responses=True)
def add_to_redis(key, value):
    print(value)
    for i in range(len(value)):
        temp=value[i].lower()
        value[i]=temp
    print(value)
    redis_client.set(key, json.dumps(value))
def get_from_redis(key):
    value = redis_client.get(key)
    if value is not None:
        return value.decode('utf-8')
    return None

