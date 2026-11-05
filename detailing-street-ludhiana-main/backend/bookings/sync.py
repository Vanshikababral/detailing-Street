import re
import uuid


def sync_customer(data, collection, now):
    phone = re.sub(r'\s+', '', data.get('phoneNumber', ''))
    name = data.get('customerName', '').strip()
    if not phone or not name:
        raise ValueError('A customer name and phone number are required to sync a booking.')

    fields = {
        'name': name,
        'phone': phone,
        'updatedAt': now,
    }
    for source, target in (
        ('email', 'email'),
        ('state', 'state'),
        ('address', 'address'),
        ('city', 'city'),
        ('zipCode', 'zipCode'),
    ):
        value = data.get(source, '').strip()
        if value:
            fields[target] = value

    result = collection.update_one(
        {'phone': phone},
        {
            '$set': fields,
            '$setOnInsert': {
                'customerId': f'CUST-{uuid.uuid4().hex[:8].upper()}',
                'totalVisits': 0,
                'totalSpent': 0,
                'lastVisit': '',
                'type': 'New',
                'createdAt': now,
            },
        },
        upsert=True,
    )
    if result.upserted_id is not None:
        return str(result.upserted_id)

    customer = collection.find_one({'phone': phone}, {'_id': 1})
    if not customer:
        raise RuntimeError('Customer synchronization did not return the saved profile.')
    return str(customer['_id'])


def sync_vehicle(data, collection, customer_id, now):
    registration = data.get('vehicleRegistration', '').strip().upper()
    make = data.get('vehicleMake', '').strip()
    model = data.get('vehicleModel', '').strip()
    if not registration or not make or not model:
        return False

    collection.update_one(
        {'registration': registration},
        {
            '$set': {
                'registration': registration,
                'make': make,
                'model': model,
                'ownerId': customer_id,
                'ownerName': data['customerName'].strip(),
                'updatedAt': now,
            },
            '$setOnInsert': {
                'serviceCount': 0,
                'totalSpent': 0,
                'createdAt': now,
            },
        },
        upsert=True,
    )
    return True
