def get_person_name_by_img(personInfos, imgName):
    for person in personInfos:
        if person.get("imgName") == imgName:
            return person.get("name")
    return None
