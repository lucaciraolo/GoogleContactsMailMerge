import codecs
import csv


class Person:
    def __init__(self, name, mail_title, address):
        self.name = name
        self.mail_title = mail_title
        self.address = address


with codecs.open('google_export.csv', 'rU', 'utf-16') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    count = 0
    errors = 0
    headers = []
    rows = []
    for row in csv_reader:
        if count == 0:
            headers = row
        else:
            rows.append(row)
        count += 1

    people = []
    for row in rows:
        address_index = 0
        custom_field_index = 0
        name = ""
        mail_title = ""
        address = ""
        for key, value in zip(headers, row):
            if value:
                if key == "Name":
                    name = value

                if "Custom Field" in key:
                    # if "Type" in key and value == "Mail Title":
                    if "Type" in key and value.lower() == "Mail Title".lower():
                        custom_field_index = key[13]

                    if "Value" in key and key[13] == custom_field_index:
                        mail_title = value

                if "Address" in key:
                    if "Type" in key and value == "Home":
                        address_index = key[8]

                    if key[8] == address_index:
                        if "Formatted" in key:
                            address = value


        if name and mail_title and address:
            people.append(Person(name, mail_title, address))
        else:
            errors += 1
            print("Missing info for ", name)
            if not mail_title:
                print("\t", "-Mail Title not found")
            if not address:
                print("\t", "-Home address not found")

print("\n\n", len(people), "Correct contacts out of", len(rows))
print(errors, "contacts with errors")


class Address:
    def __init__(self, street, city, region, postcode, country):
        self.street = street
        self.city = city
        self.region = region
        self.postcode = postcode
        self.country = country

    def formatted_address(self):
        return "\r".join([self.street, self.city, self.region, self.postcode, self.country])



