import redis 

r=redis.Redis(host='localhost', port=6379, db=0)


def add_to_redis(key, value):
    r.set(key, value)

def get_from_redis(key):
    return r.get(key)   





